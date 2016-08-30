defmodule Ruru.RoomChannel do
  use Phoenix.Channel

  intercept ["new_msg"]

  alias Ruru.User
  alias Ruru.Message
  alias Ruru.Repo
  alias Ruru.Session
  alias Ruru.Chat
  alias Ruru.Presence
  alias Ruru.Operator

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> chat_id, %{"role" => role, "operator" => operator}, socket) when role == "operator" do
#    send(self, :after_join)
    case Repo.get(Chat, chat_id) do
        nil -> {:error, socket}
        chat -> 
          socket = assign(socket, :chat_id, chat_id)
          case is_number(chat.operator_id) do
            true ->
              {:ok, socket}
            false ->              
              chatOperator = Repo.get!(Operator, operator)
              chat = Ecto.Changeset.change chat, operator_id: chatOperator.id
              case Repo.update chat do
                {:ok, struct}       -> {:ok, socket} # Updated with success
                {:error, changeset} -> {:error, socket} # Something went wrong
              end            
          end
    end        
  end

  def join("room:" <> chat_id, %{"guest" => guest, "role" => role}, socket) do
#    send(self, :after_join)
    ## controllare se chat id e guest id corrisopndono, role è user o operator
    case User |> User.by_username(guest) |> Repo.one do
        nil -> 
          {:error, socket}
        user -> 
          socket = assign(socket, :chat_id, chat_id)
          chat = Repo.get!(Chat, chat_id)
          chat = Ecto.Changeset.change chat, status: true
          Repo.update!(chat)
          {:ok, socket}
    end    
  end

  #aggiungere id utente e ruolo tra i parametri ricevuti
  def handle_in("new_msg", %{"body" => body, "author" => author, "guest" => guest, "role" => role}, socket) do
    chat = Repo.get!(Chat, socket.assigns[:chat_id])
    changeset = Message.changeset(%Message{}, %{text: body, sender: role, sender_id: guest, chat_id: chat.id})
    Repo.insert!(changeset)    
    broadcast! socket, "new_msg", %{body: body, author: author, role: role, guest: guest}
    {:noreply, socket}
  end

  def handle_in("usr_leave", %{"role" => role}, socket) do
    chat_id = socket.assigns[:chat_id]
    chat = Repo.get!(Chat, chat_id)
    chat = Ecto.Changeset.change chat, status: false
    Repo.update!(chat)    
    Ruru.Endpoint.broadcast_from! self(), "answer:users", "usr_left", %{chat_id: chat_id}
    {:stop, :shutdown, socket}
  end

  def handle_out("new_msg", payload, socket) do
    push socket, "new_msg", payload
    {:noreply, socket}
  end

#  def handle_info(:after_join, socket) do
#    push socket, "presence_state", Presence.list(socket)
#    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
#      online_at: inspect(System.system_time(:seconds))
#    })
#    {:noreply, socket}
#  end

  def terminate(msg, socket) do
    ## cambiare stato al canale nel db
    {:shutdown, :closed}
  end
  
end