defmodule Ruru.LoginController do
  use Ruru.Web, :controller

  alias Ruru.Operator
  alias Ecto.Changeset
  alias Comeonin.Bcrypt
  alias Phoenix.Token

  def login(conn, _params) do
    changeset = Operator.changeset(%Operator{})
    render(conn, "login.html", changeset: changeset)
  end

  def checklogin(conn, %{"operator" => operator_params}) do
    case Repo.get_by(Operator, email: operator_params["email"]) do
      nil ->
        conn
          |> put_flash(:error, "Operator NOT logged.")
          |> redirect(to: login_path(conn, :login))
      operator ->
        case Bcrypt.checkpw(operator_params["cleanpwd"], operator.password) do
          true ->
            conn
              |> put_session(:logged_operator, operator.id)
              |> put_session(:token, Token.sign(conn, "operator", operator.id))
              |> put_flash(:info, "Operator logged.")
              |> redirect(to: operator_path(conn, :show, operator))
          _ ->
            conn
              |> put_flash(:error, "Operator NOT logged - password error.")
              |> redirect(to: login_path(conn, :login))
        end
    end
  end

  def logout(conn, _params) do
    conn
      |> delete_session(:logged_operator)
      |> put_flash(:info, "Operator logged out.")
      |> redirect(to: login_path(conn, :login))
    end

end
