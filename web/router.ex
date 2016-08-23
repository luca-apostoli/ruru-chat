defmodule Ruru.Router do
  use Ruru.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :browser_auth do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Ruru.Plugs.Authentication
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  resources "/users", UserController
  resources "/messages", MessageController
  resources "/chats", ChatController

  scope "/admin", Ruru do
    pipe_through :browser_auth # Use the default browser stack + auth
    
    get "/chats/answer", ChatController, :answer
    post "/operators/update/:id", OperatorController, :update
    get "/operators/show/:id", OperatorController, :show
    get "/operators/edit/:id", OperatorController, :edit
    delete "/operators/delete/:id", OperatorController, :delete
    post "/operators/create", OperatorController, :create
    get "/operators/new", OperatorController, :new
    get "/operators", OperatorController, :index    
  end

  scope "/", Ruru do
    pipe_through :browser # Use the default browser stack

    post "/checklogin", LoginController, :checklogin
    get "/login", LoginController, :login
    get "/logout", LoginController, :logout
    get "/", PageController, :index
  end    


  # Other scopes may use custom stacks.
  scope "/api", Ruru do
    pipe_through :api

    get "/messages/preload", PageController, :preload
    get "/create/:email", PageController, :create
  end
end
