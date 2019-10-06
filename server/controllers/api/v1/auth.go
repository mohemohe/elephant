package v1

import (
	"github.com/labstack/echo/v4"
	"github.com/mohemohe/elephant/server/models"
	"net/http"
)

type (
	AuthRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	AuthResponse struct {
		User  *models.User `json:"user"`
		Token *string      `json:"token"`
	}
)

func AuthLogin(c echo.Context) error {
	authRequest := new(AuthRequest)
	if err := c.Bind(authRequest); err != nil {
		panic("bind error")
	}

	user, token := models.AuthroizeUser(authRequest.Email, authRequest.Password)
	if token == nil {
		panic("invalid token")
	}

	return c.JSON(http.StatusOK, AuthResponse{
		User:  user,
		Token: token,
	})
}

func AuthCheck(c echo.Context) error {
	user := c.Get("User").(*models.User)
	return c.JSON(http.StatusOK, AuthResponse{
		User: user,
	})
}

func AuthLogout(c echo.Context) error {
	// TODO:
	return c.NoContent(http.StatusOK)
}