defmodule Ruru.AnswerChannel do
  use Phoenix.Channel

  alias Ruru.Repo
  alias Ruru.User

  intercept ["new_usr", "usr_left"]

  def join("answer:users", _message, socket) do
    {:ok, socket}
  end

  def join("answer:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_usr", %{"name" => name, "chat" => chat}, socket) do
    user = Repo.get!(User, {:chats, chat})
    broadcast! socket, "new_usr", %{id: user.id, chat: chat, name: name}
    {:noreply, socket}
  end

  def handle_in("usr_left", %{"chat" => chat_id}, socket) do
    broadcast! socket, "usr_left", %{chat: chat_id}
    {:noreply, socket}
  end

  def handle_out("new_usr", payload, socket) do
    push socket, "new_usr", payload
    {:noreply, socket}
  end
  
  def handle_out("usr_left", payload, socket) do
    push socket, "usr_left", payload
    {:noreply, socket}
  end
  
end