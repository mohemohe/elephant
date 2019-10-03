package models

import (
	"github.com/globalsign/mgo/bson"
	"github.com/go-bongo/bongo"
	"github.com/mohemohe/parakeet/server/models/connection"
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
)

func GetBookById(id string) *Book {
	conn := connection.Mongo()

	book := &Book{}
	err := conn.Collection(collections.Books).FindById(bson.ObjectIdHex(id), book)
	if err != nil {
		return nil
	}

	return book
}

func UpsertBook(book *Book) error {
	return connection.Mongo().Collection(collections.Books).Save(book)
}
