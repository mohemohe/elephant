package models

import (
	"encoding/json"
	"errors"
	"github.com/globalsign/mgo/bson"
	"github.com/go-bongo/bongo"
	"github.com/mohemohe/elephant/server/models/connections"
	"github.com/mohemohe/elephant/server/types"
	"io/ioutil"
	"net/http"
)

type (
	Book struct {
		bongo.DocumentBase `bson:",inline"`
		GoogleID           string   `bson:"google_id" json:"google_id"`
		Title              string   `bson:"title" json:"title"`
		Authors            []string `bson:"authors" json:"authors"`
		Description        string   `bson:"description" json:"description"`
		ThumbnailURL       string   `bson:"thumbnail_url" json:"thumbnail_url"`
	}
	Books struct {
		Info  *bongo.PaginationInfo `bson:"-" json:"info"`
		Books []Book                `bson:"-" json:"books"`
	}
)

func FindBook(perPage int, page int, qs []string) *Books {
	conn := connections.Mongo()
	q := bson.M{}
	if qs != nil && len(qs) != 0 {
		or := make([]bson.M, 0)
		for _, v := range qs {
			p := `^.*` + v + `.*$`
			or = append(or, bson.M{"google_id": v}, bson.M{"title": bson.RegEx{Pattern: p, Options:"m"}}, bson.M{"description": bson.RegEx{Pattern: p, Options:"m"}}, bson.M{"authors": bson.RegEx{Pattern: p, Options:"m"}})
		}
		q["$or"] = or
	}
	find := conn.Collection(collections.Books).Find(q)
	if find == nil {
		return nil
	}
	find.Query.Sort("-_created")
	info, err := find.Paginate(perPage, page)
	if err != nil {
		return nil
	}
	bookSlice := make([]Book, info.RecordsOnPage)
	for i := 0; i < info.RecordsOnPage; i++ {
		_ = find.Next(&bookSlice[i])
	}

	cs := &Books{
		Info:  info,
		Books: bookSlice,
	}
	return cs
}

func FindBookByGoogleID(googleID string) *Book {
	conn := connections.Mongo()

	book := &Book{}
	err := conn.Collection(collections.Books).FindOne(bson.M{"google_id": googleID}, book)
	if err != nil {
		return nil
	}

	return book
}

func CreateBook(googleID string) (*Book, error) {
	resp, err := http.Get("https://www.googleapis.com/books/v1/volumes?q=" + googleID)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	bytes, _ := ioutil.ReadAll(resp.Body)
	result := new(types.GoogleBookAPIResult)
	if err := json.Unmarshal(bytes, result); err != nil {
		return nil, err
	}
	if len(result.Items) == 0 {
		return nil, errors.New("not found")
	}
	item := result.Items[0]
	if item.ID != googleID {
		return nil, errors.New("invalid api result")
	}
	book := &Book{
		GoogleID:     item.ID,
		Title:        item.VolumeInfo.Title,
		Authors:      item.VolumeInfo.Authors,
		Description:  item.VolumeInfo.Description,
		ThumbnailURL: item.VolumeInfo.ImageLinks.Thumbnail,
	}
	if err := connections.Mongo().Collection(collections.Books).Save(book); err != nil {
		return nil, err
	}
	return book, nil
}
