package main

import (
	"github.com/labstack/echo/v4"
	"github.com/mohemohe/echoHelper/v4"
	"github.com/mohemohe/elephant/server/configs"
	"github.com/mohemohe/elephant/server/controllers"
	v1 "github.com/mohemohe/elephant/server/controllers/api/v1"
	"github.com/mohemohe/elephant/server/middlewares"
	"github.com/mohemohe/elephant/server/models"
	"github.com/mohemohe/elephant/server/templates"
	"github.com/playree/goingtpl"
)

func main() {
	_ = configs.GetEnv()
	_ = configs.GetUnix()

	go models.InitDB()

	eh := echoHelper.New(echo.New())
	eh.RegisterRoutes([]echoHelper.Route{
		{echo.GET, "/", controllers.Index, nil},

		{echo.GET, "/api/v1/auth", v1.AuthCheck, &[]echo.MiddlewareFunc{middlewares.Authorized}},
		{echo.POST, "/api/v1/auth", v1.AuthLogin, nil},
		{echo.DELETE, "/api/v1/auth", v1.AuthLogout, nil},
		// {echo.POST, "/api/v1/users", v1.CreateUser, nil},
		// {echo.GET, "/api/v1/users/:id", v1.CreateUser, &[]echo.MiddlewareFunc{middlewares.Authorized}},
		// {echo.PUT, "/api/v1/users/:id", v1.CreateUser, &[]echo.MiddlewareFunc{middlewares.Authorized}},
		{echo.GET, "/api/v1/books", v1.GetBooks, nil},
		{echo.GET, "/api/v1/collections", v1.GetCollections, nil},
		{echo.POST, "/api/v1/collections", v1.PostCollections, nil},
		// {echo.GET, "/api/v1/collections/:id", v1.GetCollections, nil},
		{echo.GET, "/api/v1/requests", v1.GetRequests, nil},
		{echo.POST, "/api/v1/requests", v1.PostRequests, nil},
		// {echo.GET, "/api/v1/requests/:id", v1.GetCollections, nil},
		// {echo.GET, "/api/v1/votes/:id", v1.GetCollections, nil},
		// {echo.PUT, "/api/v1/votes/:id", v1.GetCollections, nil},
		// {echo.DELETE, "/api/v1/votes/:id", v1.GetCollections, nil},

	})
	eh.Echo().Static("/public", "public")

	goingtpl.SetBaseDir("./templates")
	goingtpl.EnableCache(configs.GetEnv().Echo.Env != "debug")
	t := &templates.Template{}
	eh.Echo().Renderer = t

	if configs.GetEnv().Echo.Env == "debug" {
		eh.Echo().Logger.SetLevel(0)
	}

	eh.Serve()
}