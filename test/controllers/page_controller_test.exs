defmodule Ruru.PageControllerTest do
  use Ruru.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "Ruru - support chat"
  end
end
