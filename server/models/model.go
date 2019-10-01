package models

import (
	"github.com/globalsign/mgo"
	"github.com/mobilusoss/mgo-pubsub"
	"github.com/mohemohe/elephant/server/configs"
	"github.com/mohemohe/elephant/server/models/connections"
	"github.com/mohemohe/elephant/server/util"
	"github.com/sirupsen/logrus"
)

var collections = struct {
	PubSub  string
	Entries string
	Users   string
	KVS     string
}{
	PubSub:  "pubsub",
	Entries: "entries",
	Users:   "users",
	KVS:     "kvs",
}

type (
	NotifyMastodon struct {
		BaseURL  string `json:"baseurl"`
		Token    string `json:"token"`
		Template string `json:"template"`
	}
	ServerSideRendering struct {
		Entries  bool `json:"entries"`
		Entry    bool `json:"entry"`
	}
)

const (
	KVCacheSize = "cache_size" // TODO:
	KVEnableMongoDBQueryCache = "mongo_db_query_cache"
	KVEnableSSRPageCache = "ssr_page_cache"
	KVSiteTitle = "site_title"
	KVNotifyMastodon = "notify_mastodon"
	KVServerSideRendering = "server_side_rendering"
)

var pubsub *mgo_pubsub.PubSub

func InitDB() {
	ensureIndex(collections.KVS, getIndex([]string{"key"}, true, false))

	if p, err := mgo_pubsub.NewPubSub(configs.GetEnv().Mongo.Address, configs.GetEnv().Mongo.Database, "pubsub"); err != nil {
		util.Logger().WithField("error", err).Fatalln("pubsub connection error")
	} else {
		pubsub = p
	}

	if err := pubsub.Initialize(); err != nil {
		util.Logger().WithField("error", err).Fatalln("pubsub initialize error")
	}
	go pubsub.StartPubSub()

	go subscribePurgeCacheEvent()

	util.Logger().Info("DB initialized")
}

func getIndex(key []string, unique bool, sparse bool) mgo.Index {
	return mgo.Index{
		Key:        key,
		Unique:     unique,
		Sparse:     sparse,
		Background: true,
	}
}

func ensureIndex(collection string, index mgo.Index) {
	util.Logger().WithFields(logrus.Fields{
		"collection": collection,
		"index":      index,
	}).Debug("create index")
	if err := connections.Mongo().Collection(collection).Collection().EnsureIndex(index); err != nil {
		util.Logger().WithFields(logrus.Fields{
			"collection": collection,
			"index":      index,
			"error":      err,
		}).Warn("index create error")
	}
}
