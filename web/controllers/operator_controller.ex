defmodule Ruru.OperatorController do
  use Ruru.Web, :controller

  alias Ruru.Operator
  alias Ecto.Changeset

  def index(conn, _params) do
    operators = Repo.all(Operator)
    render(conn, "index.html", operators: operators)
  end

  def new(conn, _params) do
    changeset = Operator.changeset(%Operator{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"operator" => operator_params}) do
    changeset = Operator.changeset(%Operator{}, operator_params)
    changeset = Changeset.put_change(changeset, :salt, Comeonin.Bcrypt.gen_salt(12, true))
    changeset = Changeset.put_change(changeset, :password, hashed_password(Changeset.get_field(changeset, :cleanpwd), Changeset.get_field(changeset, :salt)))

    case Repo.insert(changeset) do
      {:ok, _operator} ->
        conn
        |> put_flash(:info, "Operator created successfully.")
        |> redirect(to: operator_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  defp hashed_password(password, salt) do
    Comeonin.Bcrypt.hashpass(password, salt)
  end

  def show(conn, %{"id" => id}) do
    operator = Repo.get!(Operator, id)
    render(conn, "show.html", operator: operator)
  end

  def edit(conn, %{"id" => id}) do
    operator = Repo.get!(Operator, id)
    changeset = Operator.changeset(operator)
    render(conn, "edit.html", operator: operator, changeset: changeset)
  end

  def update(conn, %{"id" => id, "operator" => operator_params}) do
    operator = Repo.get!(Operator, id)
    changeset = Operator.changeset(operator, operator_params)

    case Repo.update(changeset) do
      {:ok, operator} ->
        conn
        |> put_flash(:info, "Operator updated successfully.")
        |> redirect(to: operator_path(conn, :show, operator))
      {:error, changeset} ->
        render(conn, "edit.html", operator: operator, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    operator = Repo.get!(Operator, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(operator)

    conn
    |> put_flash(:info, "Operator deleted successfully.")
    |> redirect(to: operator_path(conn, :index))
  end

  def login(conn, _params) do
    changeset = Operator.changeset(%Operator{})
    render(conn, "login.html", changeset: changeset)
  end

  def checklogin(conn, %{"operator" => operator_params}) do
    case Repo.get_by(Operator, email: operator_params["email"]) do
      nil ->
          conn
              |> put_flash(:error, "Operator NOT logged.")
              |> redirect(to: operator_path(conn, :login))
      operator ->
        case Comeonin.Bcrypt.checkpw(operator_params["cleanpwd"], operator.password) do
          true ->
            conn
              |> put_session(:logged_operator, operator.id)
              |> put_flash(:info, "Operator logged.")
              |> redirect(to: operator_path(conn, :show, operator))
          _ ->            
            conn
              |> put_flash(:error, "Operator NOT logged - password error.")
              |> redirect(to: operator_path(conn, :login))
        end      
    end
  end

  def logout(conn, _params) do
    conn
      |> delete_session(:logged_operator)
      |> put_flash(:info, "Operator logged out.")
      |> redirect(to: operator_path(conn, :login))
  end

end
