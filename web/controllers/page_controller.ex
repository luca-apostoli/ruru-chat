defmodule Ruru.PageController do
  use Ruru.Web, :controller

  alias Ruru.Chat
  alias Ruru.User
  alias Ruru.Repo

  def index(conn, _params) do
    render conn, "index.html"
  end

  	def create(conn, %{"email" => email}) do
#		user = User.create(params)
		case Repo.get_by(User, email: email) do
			nil -> 
				changeset = User.changeset(%User{}, %{name: email, email: email})
			    case Repo.insert(changeset) do
			      {:ok, newuser} ->
			        json conn, loadUserChat(newuser, %{token: Phoenix.Token.sign(conn, "user", newuser.id), user: newuser.id, name: newuser.name, chat: 0})
			      {:error, _changeset} ->
			        :error
			    end
		    user ->
				json conn, loadUserChat(user, %{token: Phoenix.Token.sign(conn, "user", user.id), user: user.id, name: user.name, chat: 0})
		end
	end

	defp loadUserChat(user, params \\ %{}) do
	    case Chat |> Chat.by_user(user) |> Chat.open |> Chat.sorted |> first |> Repo.one do
	      nil ->
	        chat = Chat.changeset(%Chat{}, %{user_id: user.id})
	        case Repo.insert(chat) do
	        	{:ok, newchat} -> 
	        		Ruru.Endpoint.broadcast! "answer:users", "new_usr", %{name: user.name, chat: newchat.id}
	        		%{params | chat: newchat.id}
	    		{:error, _details} ->
	    			:error
	        end
	      loadedchat ->
	      	Ruru.Endpoint.broadcast! "answer:users", "new_usr", %{name: user.name, chat: loadedchat.id}
	  		%{params | chat: loadedchat.id}
	    end
	end


end
