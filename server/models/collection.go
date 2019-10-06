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
	Collection struct {
		bongo.DocumentBase `bson:",inline"`
		GoogleID           string `bson:"google_id" json:"google_id"`
	}

	Collections struct {
		Info        *bongo.PaginationInfo `bson:"-" json:"info"`
		Collections []Collection          `bson:"-" json:"collections"`
	}
)

func FindCollection(perPage int, page int, ids []string) *Collections {
	cacheKey := "collections:" + strconv.Itoa(perPage) + ":" + strconv.Itoa(page) + ":" + util.HashIdsFromString(strings.Join(ids, ","))

	c := new(Collections)
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
	collectionSlice := make([]Collection, info.RecordsOnPage)
	for i := 0; i < info.RecordsOnPage; i++ {
		_ = find.Next(&collectionSlice[i])
	}

	cs := &Collections{
		Info:        info,
		Collections: collectionSlice,
	}
	_ = SetCache(cacheKey, collections)
	return cs
}

func CreateCollection(googleID string) error {
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
