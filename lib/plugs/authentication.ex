defmodule Ruru.Plugs.Authentication do
  import Plug.Conn  

  alias Ruru.Session

  def init(default), do: default

  def call(conn, _default) do
  	case Session.is_logged?(conn) do
  		true -> 
  			conn
		_ ->
			conn
          |> Phoenix.Controller.put_flash(:error, "User is not authenticated.")
      		|> Phoenix.Controller.redirect(to: "/login")
      		|> halt
  	end
  end

end