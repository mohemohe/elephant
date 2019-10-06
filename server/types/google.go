package types

import (
	"encoding/json"
)

type (
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
			SaleInfo *json.RawMessage `json:"saleInfo"`
			AccessInfo *json.RawMessage `json:"accessInfo"`
			SearchInfo *json.RawMessage `json:"searchInfo"`
		} `json:"items"`
	}
)