defmodule Ruru.OperatorController do
  use Ruru.Web, :controller

  alias Ruru.Operator
  alias Ecto.Changeset
  alias Comeonin.Bcrypt

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
    changeset = Changeset.put_change(changeset, :salt, Bcrypt.gen_salt(12, true))
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
    Bcrypt.hashpass(password, salt)
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
  
end
