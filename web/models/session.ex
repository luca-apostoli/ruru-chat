defmodule Ruru.Session do
  @moduledoc """
    Wrapper for session handling
  """
	alias Ruru.Operator
  alias Ruru.Repo
  alias Plug.Conn

	def current_operator(conn) do
    id = Conn.get_session(conn, :logged_operator)
    if id, do: Repo.get!(Operator, id)
  end

	def is_logged?(conn), do: !!current_operator(conn)

	def get_token(conn), do: Conn.get_session(conn, :token)

end
