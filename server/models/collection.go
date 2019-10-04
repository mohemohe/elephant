package models

import (
	"encoding/json"
	"errors"
	"github.com/globalsign/mgo/bson"
	"github.com/go-bongo/bongo"
	"github.com/mohemohe/parakeet/server/models/connection"
	"io/ioutil"
	"net/http"
)

type (
	Collecton struct {
		bongo.DocumentBase `bson:",inline"`
		BookID             bson.ObjectId `bson:"book_id" json:"book_id"`
	}

	GoogleBookAPIResult struct {
		Kind       string `json:"kind"`
		TotalItems int    `json:"totalItems"`
		Items      []struct {
			Kind       string `json:"kind"`
			ID         string `json:"id"`
			Etag       string `json:"etag"`
			SelfLink   string `json:"selfLink"`
			VolumeInfo struct {
				Title               string   `json:"title"`
				Authors             []string `json:"authors"`
				Publisher           string   `json:"publisher"`
				PublishedDate       string   `json:"publishedDate"`
				Description         string   `json:"description"`
				IndustryIdentifiers []struct {
					Type       string `json:"type"`
					Identifier string `json:"identifier"`
				} `json:"industryIdentifiers"`
				ReadingModes struct {
					Text  bool `json:"text"`
					Image bool `json:"image"`
				} `json:"readingModes"`
				PrintType           string   `json:"printType"`
				Categories          []string `json:"categories"`
				MaturityRating      string   `json:"maturityRating"`
				AllowAnonLogging    bool     `json:"allowAnonLogging"`
				ContentVersion      string   `json:"contentVersion"`
				PanelizationSummary struct {
					ContainsEpubBubbles  bool `json:"containsEpubBubbles"`
					ContainsImageBubbles bool `json:"containsImageBubbles"`
				} `json:"panelizationSummary"`
				ImageLinks struct {
					SmallThumbnail string `json:"smallThumbnail"`
					Thumbnail      string `json:"thumbnail"`
				} `json:"imageLinks"`
				Language            string `json:"language"`
				PreviewLink         string `json:"previewLink"`
				InfoLink            string `json:"infoLink"`
				CanonicalVolumeLink string `json:"canonicalVolumeLink"`
			} `json:"volumeInfo"`
			SaleInfo struct {
				Country     string `json:"country"`
				Saleability string `json:"saleability"`
				IsEbook     bool   `json:"isEbook"`
				ListPrice   struct {
					Amount       float64 `json:"amount"`
					CurrencyCode string  `json:"currencyCode"`
				} `json:"listPrice"`
				RetailPrice struct {
					Amount       float64 `json:"amount"`
					CurrencyCode string  `json:"currencyCode"`
				} `json:"retailPrice"`
				BuyLink string `json:"buyLink"`
				Offers  []struct {
					FinskyOfferType int `json:"finskyOfferType"`
					ListPrice       struct {
						AmountInMicros int    `json:"amountInMicros"`
						CurrencyCode   string `json:"currencyCode"`
					} `json:"listPrice"`
					RetailPrice struct {
						AmountInMicros int    `json:"amountInMicros"`
						CurrencyCode   string `json:"currencyCode"`
					} `json:"retailPrice"`
				} `json:"offers"`
			} `json:"saleInfo"`
			AccessInfo struct {
				Country                string `json:"country"`
				Viewability            string `json:"viewability"`
				Embeddable             bool   `json:"embeddable"`
				PublicDomain           bool   `json:"publicDomain"`
				TextToSpeechPermission string `json:"textToSpeechPermission"`
				Epub                   struct {
					IsAvailable  bool   `json:"isAvailable"`
					AcsTokenLink string `json:"acsTokenLink"`
				} `json:"epub"`
				Pdf struct {
					IsAvailable  bool   `json:"isAvailable"`
					AcsTokenLink string `json:"acsTokenLink"`
				} `json:"pdf"`
				WebReaderLink       string `json:"webReaderLink"`
				AccessViewStatus    string `json:"accessViewStatus"`
				QuoteSharingAllowed bool   `json:"quoteSharingAllowed"`
			} `json:"accessInfo"`
			SearchInfo struct {
				TextSnippet string `json:"textSnippet"`
			} `json:"searchInfo"`
		} `json:"items"`
	}
)

func GetCollections(id string) *Book {
	conn := connection.Mongo()

	book := &Book{}
	err := conn.Collection(collections.Books).FindById(bson.ObjectIdHex(id), book)
	if err != nil {
		return nil
	}

	return book
}

func PutCollection(GoogleID string) error {
	resp, err := http.Get("https://www.googleapis.com/books/v1/volumes?q=" + GoogleID)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	bytes, _ := ioutil.ReadAll(resp.Body)
	result := new(GoogleBookAPIResult)
	if err := json.Unmarshal(bytes, result); err != nil {
		return err
	}
	if len(result.Items) == 0 {
		return errors.New("not found")
	}
	item := result.Items[0]
	if item.ID != GoogleID {
		return errors.New("invalid api result")
	}
	book := &Book{
		GoogleID:     item.ID,
		Title:        item.VolumeInfo.Title,
		Authors:      item.VolumeInfo.Authors,
		Description:  item.VolumeInfo.Description,
		ThumbnailURL: item.VolumeInfo.ImageLinks.Thumbnail,
	}
	if err := connection.Mongo().Collection(collections.Books).Save(book); err != nil {
		return err
	}
	collection := &Collecton{
		BookID:       book.Id,
	}
	return connection.Mongo().Collection(collections.Collection).Save(collection)
}
