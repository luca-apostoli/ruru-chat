defmodule Ruru.PageController do
  use Ruru.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
