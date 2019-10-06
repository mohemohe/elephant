package util

import (
	"crypto/sha512"
	"encoding/hex"
	go_hashids "github.com/speps/go-hashids"
	"io"
)

var hashids *go_hashids.HashID

func initHashIds() {
	hd := go_hashids.NewData()
	hd.Salt = "elephant"
	hashids, _ = go_hashids.NewWithData(hd)
}

func HashIdsFromString(str string) string {
	if hashids == nil {
		initHashIds()
	}

	h := sha512.New()
	_, _ = io.WriteString(h, str)
	src := hex.EncodeToString(h.Sum(nil))
	result, _ := hashids.EncodeHex(src)
	return result
}