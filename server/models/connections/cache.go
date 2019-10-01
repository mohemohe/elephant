package connections

import (
	"github.com/emluque/dscache"
	"runtime"
)

var dsConn *dscache.Dscache

func DsCache() *dscache.Dscache {
	if dsConn == nil {
		dsConn = newDsCache()
	}
	return dsConn
}

func PurgeDsCache() {
	dsConn = newDsCache()
	go runtime.GC()
}

func newDsCache() *dscache.Dscache {
	conn, err := dscache.New(64 * dscache.MB)
	if err != nil {
		panic(err)
	}
	return conn
}