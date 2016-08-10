defmodule Ruru.AnswerChannel do
  use Phoenix.Channel

  def join("answer:users", _message, socket) do
    {:ok, socket}
  end

  def join("answer:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_usr", %{"name" => name, "chat" => chat}, socket) do
    broadcast! socket, "new_usr", %{chat: chat, name: name}
    {:noreply, socket}
  end

  def handle_out("new_usr", payload, socket) do
    push socket, "new_usr", payload
    {:noreply, socket}
  end
  
end