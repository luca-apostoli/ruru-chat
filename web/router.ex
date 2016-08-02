defmodule Ruru.Router do
  use Ruru.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

#  resources "/operators", OperatorController
  resources "/users", UserController
  resources "/messages", MessageController
  resources "/chats", ChatController


  scope "/", Ruru do
    pipe_through :browser # Use the default browser stack
    
    post "/operators/update/:id", OperatorController, :update
    get "/operators/show/:id", OperatorController, :show
    get "/operators/edit/:id", OperatorController, :edit
    delete "/operators/delete/:id", OperatorController, :delete
    post "/operators/create", OperatorController, :create
    get "/operators/new", OperatorController, :new
    get "/operators", OperatorController, :index
    post "/checklogin", OperatorController, :checklogin
    get "/login", OperatorController, :login
    get "/logout", OperatorController, :logout
    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", Ruru do
  #   pipe_through :api
  # end
end
