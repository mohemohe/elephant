package models

import (
	"encoding/json"
	"errors"
	"github.com/globalsign/mgo/bson"
	"github.com/go-bongo/bongo"
	"github.com/mohemohe/elephant/server/types"
	"github.com/mohemohe/elephant/server/util"
	"github.com/mohemohe/parakeet/server/models/connection"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
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

func FindBookByGoogleIDs(perPage int, page int, ids []string) *Books {
	cacheKey := "collections:" + strconv.Itoa(perPage) + ":" + strconv.Itoa(page) + ":" + util.HashIdsFromString(strings.Join(ids, ","))

	c := new(Books)
	if err := GetCache(cacheKey, c); err == nil {
		return c
	}

	conn := connection.Mongo()
	q := bson.M{}
	if ids != nil && len(ids) != 0 {
		or := make([]bson.M, len(ids))
		for i, v := range ids {
			or[i] = bson.M{"book_id": v}
		}
		q["$or"] = or
	}
	find := conn.Collection(collections.Collections).Find(q)
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
	_ = SetCache(cacheKey, collections)
	return cs
}

func FindBookByGoogleID(googleID string) *Book {
	conn := connection.Mongo()

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
	if err := connection.Mongo().Collection(collections.Books).Save(book); err != nil {
		return nil, err
	}
	return book, nil
}
