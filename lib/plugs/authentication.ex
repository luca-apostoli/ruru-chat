defmodule Ruru.Plugs.Authentication do

  @moduledoc """
    module to check authentication
  """
  import Plug.Conn  

  alias Ruru.Session
  alias Phoenix.Controller

  def init(default), do: default

  def call(conn, _default) do
    case Session.is_logged?(conn) do
      true ->
        conn
      _ ->
        conn
          |> Controller.put_flash(:error, "User is not authenticated.")
          |> Controller.redirect(to: "/login")
          |> halt
    end
  end

end
