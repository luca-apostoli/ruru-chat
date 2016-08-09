defmodule Ruru.AnswerChannel do
  use Phoenix.Channel

  def join("answer:users", _message, socket) do
    {:ok, socket}
  end

  def join("answer:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"body" => body, "author" => author}, socket) do
    broadcast! socket, "new_msg", %{body: body, author: author}
    {:noreply, socket}
  end

  def handle_out("new_msg", payload, socket) do
    push socket, "new_msg", payload
    {:noreply, socket}
  end
  
end