package models

import (
	"errors"
	"time"

	"github.com/mohemohe/elephant/server/models/connections"
	"github.com/mohemohe/elephant/server/util"
	"github.com/sirupsen/logrus"
)

const (
	purgeCacheEvent = "purge_cache"
)

func GetCache(key string, ptr interface{}) error {
	if item, hit := connections.DsCache().Get(key); hit {
		return util.BytesStringToStruct(item, ptr)
	}
	return errors.New("not found")
}

func SetCache(key string, value interface{}) error {
	v, err := util.StructToBytesString(value)
	if err != nil {
		return err
	}
	return connections.DsCache().Set(key, v, 10*time.Minute)
}

func PurgeCache() {
	go connections.PurgeDsCache()
	go func() {
		if err := pubsub.Publish(purgeCacheEvent, ""); err != nil {
			util.Logger().Warn(err)
		}
	}()
}

func subscribePurgeCacheEvent() {
	ch := pubsub.Subscribe(purgeCacheEvent)
	defer pubsub.UnSubscribe(purgeCacheEvent, ch)

	for {
		_, ok := <-*ch
		if !ok {
			break
		}
		util.Logger().WithFields(logrus.Fields{
			"event": purgeCacheEvent,
		}).Info("published")
		connections.PurgeDsCache()
	}
}
