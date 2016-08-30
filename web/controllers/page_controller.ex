defmodule Ruru.PageController do
	use Ruru.Web, :controller

	require Logger

	alias Ruru.Chat
	alias Ruru.User
	alias Ruru.Operator
	alias Ruru.Repo
	alias Ruru.Message

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

	def auth_preload(conn, %{"token" => token, "chat" => chat_id, "target" => target}) when target == "messages" do		
		case Phoenix.Token.verify(conn, "operator", token, max_age: 1209600) do
      		{:ok, operator_id} -> 
      			operator = Repo.get!(Operator, operator_id)
      			case Chat |> Chat.by_operator(operator) |> Chat.open |> Chat.by_id(chat_id) |> first |> Repo.one do
      				nil -> 
      					json conn, %{}
  					chat ->
  						## carico i messaggi 
  						case Message |> Message.by_chat(chat) |> Message.sorted |> Repo.all do
  							nil -> 
  								json conn, %{}
							messages ->
								json conn, messages
  						end
      					
      			end
      		{:error, _} ->
        		:error
    	end
	end

	def auth_preload(conn, %{"token" => token, "target" => target}) do
		case Phoenix.Token.verify(conn, "operator", token, max_age: 1209600) do
      		{:ok, operator_id} -> 
      			operator = Repo.get!(Operator, operator_id)
      			case Chat |> Chat.open |> Chat.with_users |> Chat.with_operators |> Chat.sorted |> Repo.all do
      				nil -> 
      					json conn, %{}
  					users ->
						json conn, users
      			end
      		{:error, _} ->
        		:error
    	end
	end

	def usr_preload(conn, %{"token" => token, "chat" => chat_id}) do
		Logger.debug chat_id
		case Phoenix.Token.verify(conn, "user", token, max_age: 1209600) do
      		{:ok, user_id} -> 
      			user = Repo.get!(User, user_id)
      			case Chat |> Chat.by_user(user) |> Chat.open |> Chat.by_id(chat_id) |> first |> Repo.one do
      				:error -> 
      					json conn, %{}
      				nil -> 
      					json conn, %{}
  					chat ->
  						## carico i messaggi 
  						case Message |> Message.by_chat(chat) |> Message.sorted |> Repo.all do
  							nil -> 
  								json conn, %{}
							messages ->
								json conn, messages
  						end
      					
      			end
      		{:error, _} ->
        		:error
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
