defmodule Ruru.OperatorControllerTest do
  use Ruru.ConnCase

  alias Ruru.Operator
  @valid_attrs %{email: "some content", name: "some content", password: "some content"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, operator_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing operators"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, operator_path(conn, :new)
    assert html_response(conn, 200) =~ "New operator"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, operator_path(conn, :create), operator: @valid_attrs
    assert redirected_to(conn) == operator_path(conn, :index)
    assert Repo.get_by(Operator, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, operator_path(conn, :create), operator: @invalid_attrs
    assert html_response(conn, 200) =~ "New operator"
  end

  test "shows chosen resource", %{conn: conn} do
    operator = Repo.insert! %Operator{}
    conn = get conn, operator_path(conn, :show, operator)
    assert html_response(conn, 200) =~ "Show operator"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, operator_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    operator = Repo.insert! %Operator{}
    conn = get conn, operator_path(conn, :edit, operator)
    assert html_response(conn, 200) =~ "Edit operator"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    operator = Repo.insert! %Operator{}
    conn = put conn, operator_path(conn, :update, operator), operator: @valid_attrs
    assert redirected_to(conn) == operator_path(conn, :show, operator)
    assert Repo.get_by(Operator, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    operator = Repo.insert! %Operator{}
    conn = put conn, operator_path(conn, :update, operator), operator: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit operator"
  end

  test "deletes chosen resource", %{conn: conn} do
    operator = Repo.insert! %Operator{}
    conn = delete conn, operator_path(conn, :delete, operator)
    assert redirected_to(conn) == operator_path(conn, :index)
    refute Repo.get(Operator, operator.id)
  end
end
