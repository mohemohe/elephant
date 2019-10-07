package configs

import (
	"github.com/kelseyhightower/envconfig"
)

type (
	environmentVariable struct {
		Echo struct {
			Env string `default:"debug"`
		}
		Sign struct {
			Secret string `default:"elephant"`
		}
		Cookie struct {
			Secret string `default:""`
		}
		Mongo struct {
			Address  string `default:"mongodb://127.0.0.1:27017"`
			Database string `default:"elephant"`
			SSL      bool   `default:"false"`
		}
	}
)

var cachedEnvironmentVariable *environmentVariable

func GetEnv() environmentVariable {
	if cachedEnvironmentVariable == nil {
		cachedEnvironmentVariable = new(environmentVariable)
		envconfig.MustProcess("", cachedEnvironmentVariable)
	}

	return *cachedEnvironmentVariable
}
