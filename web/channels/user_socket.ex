defmodule Ruru.UserSocket do
  use Phoenix.Socket

  alias Ruru.User
  alias Ruru.Operator
  alias Ruru.Repo  
  alias Phoenix.Transports
  alias Phoenix.Token

  ## Channels
  channel "room:*", Ruru.RoomChannel

  ## Transports
  transport :websocket, Transports.WebSocket
  transport :longpoll, Transports.LongPoll

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  def connect(%{"role" => role, "token" => token}, socket) do
    # Max age of 2 weeks (1209600 seconds)
    case Token.verify(socket, "operator", token, max_age: 1_209_600) do
      {:ok, operator_id} ->
        socket = assign(socket, :operator, Repo.get!(Operator, operator_id))
        {:ok, socket}
      {:error, _} ->
        :error
    end
  end

  def connect(%{"token" => token}, socket) do
    # Max age of 2 weeks (1209600 seconds)
    case Token.verify(socket, "user", token, max_age: 1_209_600) do
      {:ok, user_id} ->
        socket = assign(socket, :user, Repo.get!(User, user_id))
        {:ok, socket}
      {:error, _} ->
        :error
    end
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "users_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Ruru.Endpoint.broadcast("users_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
#  def id(_socket), do: nil
  def id(socket) do
    case socket.assigns[:user] do
      nil -> nil
      _ -> "users_socket:#{socket.assigns.user.id}"
    end   
 end

end
