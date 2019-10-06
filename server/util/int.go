package util

import (
	"strconv"
)

func ToInt(str string) int {
	result := 0
	if i, err := strconv.Atoi(str); err != nil {
		return result
	} else {
		result = i
	}
	return result
}