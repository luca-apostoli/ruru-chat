defmodule Ruru.RoomChannel do

  @moduledoc """
    Channel handler for public websockets
  """

  use Phoenix.Channel
  
  alias Ruru.User
  alias Ruru.Message
  alias Ruru.Repo
  alias Ruru.Session
  alias Ruru.Chat
  alias Ruru.Presence
  alias Ruru.Operator
  alias Ruru.Endpoint
  alias Ecto.Changeset


  intercept ["new_msg"]

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> chat_id, %{"role" => role, "operator" => operator}, socket) when role == "operator" do
#    send(self, :after_join)
# broadcast to answer channel the event opt_owned
    case Repo.get(Chat, chat_id) do
        nil -> {:error, socket}
        chat -> 
          socket = assign(socket, :chat_id, chat_id)
          case is_number(chat.operator_id) do
            true ->
              {:ok, socket}
            false ->              
              assign_chat_operator(operator) 
          end
    end        
  end

  defp assign_chat_operator(operator) do
    chat_operator = Repo.get!(Operator, operator)
    chat = Changeset.change chat, operator_id: chat_operator.id
    case Repo.update chat do
      {:ok, struct} -> 
        Endpoint.broadcast_from! self(), "answer:users", "opt_owned", %{chat: chat_id, operator: chatOperator.id}
        {:ok, socket} # Updated with success
      {:error, changeset} -> 
        {:error, socket} # Something went wrong
    end 
  end


  def join("room:" <> chat_id, %{"guest" => guest, "role" => role}, socket) do    
    ## controllare se chat id e guest id corrisopndono, role è user o operator
    case User |> User.by_username(guest) |> Repo.one do
        nil -> 
          {:error, socket}
        user -> 
          socket = assign(socket, :chat_id, chat_id)
          chat = Repo.get!(Chat, chat_id)
          chat = Changeset.change chat, status: true
          Repo.update!(chat)
          send(self, :after_join)
          {:ok, socket}
    end    
  end

  #aggiungere id utente e ruolo tra i parametri ricevuti
  def handle_in("new_msg", %{"body" => body, "author" => author, "guest" => guest, "role" => role}, socket) when role == "user" do
    chat = Repo.get!(Chat, socket.assigns[:chat_id])
    changeset = Message.changeset(%Message{}, %{text: body, user_id: guest, chat_id: chat.id})
    case Repo.insert(changeset) do
      {:ok, message} ->
        broadcast! socket, "new_msg", %{id: message.id, body: body, author: author, role: role, guest: guest}
        {:noreply, socket}
      {:error, _msg} ->
        {:error, socket}
    end        
  end
  
  def handle_in("new_msg", %{"body" => body, "author" => author, "guest" => guest, "role" => role}, socket) when role == "operator" do
    chat = Repo.get!(Chat, socket.assigns[:chat_id])
    changeset = Message.changeset(%Message{}, %{text: body, operator_id: guest, chat_id: chat.id})
    Repo.insert!(changeset)    
    case Repo.insert(changeset) do
      {:ok, message} ->
        broadcast! socket, "new_msg", %{id: message.id, body: body, author: author, role: role, guest: guest}
        {:noreply, socket}
      {:error, _msg} ->
        {:error, socket}
    end
    {:noreply, socket}
  end


  def handle_in("usr_leave", %{"role" => role}, socket) do
    chat_id = socket.assigns[:chat_id]
    chat = Repo.get!(Chat, chat_id)
    chat = Changeset.change chat, status: false
    Repo.update!(chat)    
    Endpoint.broadcast_from! self(), "answer:users", "usr_left", %{chat_id: chat_id}
    {:stop, :shutdown, socket}
  end

  def handle_out("new_msg", payload, socket) do
    push socket, "new_msg", payload
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns[:user].id, %{
      online_at: inspect(System.system_time(:seconds))
    })
    {:noreply, socket}
  end

  def terminate(msg, socket) do
    ## cambiare stato al canale nel db
    {:shutdown, :closed}
  end
  
end
