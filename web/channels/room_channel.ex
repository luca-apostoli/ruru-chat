defmodule Ruru.RoomChannel do
  use Phoenix.Channel

  alias Ruru.User
  alias Ruru.Message
  alias Ruru.Repo
  alias Ruru.Session
  alias Ruru.Chat
  alias Ruru.Presence

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> chat_id, %{"role" => role}, socket) do
    ## controllare se utente loggato e aggiornare la chat con operator id = utente loggato
#    send(self, :after_join)
    case Repo.get(Chat, chat_id) do
        nil -> {:error, socket}
        chat -> 
          socket = assign(socket, :chat_id, chat_id)
          {:ok, socket}
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
          {:ok, socket}
    end    
  end

  #aggiungere id utente e ruolo tra i parametri ricevuti
  def handle_in("new_msg", %{"body" => body, "author" => author, "guest" => guest, "role" => role}, socket) do
    chat_id = socket.assigns[:chat_id]
    changeset = Message.changeset(%Message{}, %{text: body, sender: role, sender_id: guest, chat_id: chat_id})
    Repo.insert!(changeset)
    broadcast! socket, "new_msg", %{body: body, author: author, role: role, guest: guest}
    {:noreply, socket}
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