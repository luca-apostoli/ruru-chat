defmodule Ruru.Session do
	
	alias Ruru.Operator
	alias Ruru.Repo

	def current_operator(conn) do
		id = Plug.Conn.get_session(conn, :logged_operator)
		if id, do: Repo.get!(Operator, id) 
	end

	def is_logged?(conn), do: !!current_operator(conn) 

end