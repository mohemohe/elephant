package models

import (
	"github.com/globalsign/mgo/bson"
	"github.com/go-bongo/bongo"
	"github.com/mohemohe/elephant/server/util"
	"github.com/mohemohe/parakeet/server/models/connection"
	"strconv"
	"strings"
)

type (
	Request struct {
		bongo.DocumentBase `bson:",inline"`
		GoogleID           string `bson:"google_id" json:"google_id"`
	}
	Requests struct {
		Info     *bongo.PaginationInfo `bson:"-" json:"info"`
		Requests []Request             `bson:"-" json:"requests"`
	}
)

func FindRequest(perPage int, page int, ids []string) *Requests {
	cacheKey := "requests:" + strconv.Itoa(perPage) + ":" + strconv.Itoa(page) + ":" + util.HashIdsFromString(strings.Join(ids, ","))

	c := new(Requests)
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
	find := conn.Collection(collections.Requests).Find(q)
	if find == nil {
		return nil
	}
	find.Query.Sort("-_created")
	info, err := find.Paginate(perPage, page)
	if err != nil {
		return nil
	}
	collectionSlice := make([]Request, info.RecordsOnPage)
	for i := 0; i < info.RecordsOnPage; i++ {
		_ = find.Next(&collectionSlice[i])
	}

	cs := &Requests{
		Info:     info,
		Requests: collectionSlice,
	}
	_ = SetCache(cacheKey, collections)
	return cs
}

func CreateRequest(googleID string) error {
	book := FindBookByGoogleID(googleID)
	if book == nil {
		if b, err := CreateBook(googleID); err != nil {
			return err
		} else {
			book = b
		}
	}
	collection := &Collection{
		GoogleID: book.GoogleID,
	}
	err := connection.Mongo().Collection(collections.Collections).Save(collection)
	if err == nil {
		PurgeCache()
	}
	return err
}
