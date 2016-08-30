defmodule Ruru.Chat do
  use Ruru.Web, :model

  import Ecto.Query

  @derive {Poison.Encoder, only: [:id, :user, :operator, :status, :inserted_at]}

  schema "chats" do

    field :status, :boolean, default: false

    belongs_to :user, Ruru.User, foreign_key: :user_id
    belongs_to :operator, Ruru.Operator, foreign_key: :operator_id

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:user_id])
    |> assoc_constraint(:user)
    |> validate_required([])
  end
  
  def with_users(query) do
    from q in query, preload: [:user]
  end

  def with_operators(query) do
    from q in query, preload: [:operator]
  end

  def by_id(query, chat_id) do
    from c in query,
    where: c.id == ^chat_id
  end

  def by_user(query, user) do
    from c in query,
    join: u in Ruru.User, on: c.user_id == u.id,
    where: u.id == ^user.id
  end

  def by_operator(query, operator) do
    from c in query,
    join: o in Ruru.Operator, on: c.operator_id == o.id,
    where: o.id == ^operator.id
  end

  def open(query) do
    from c in query,
    where: c.status == true
  end

  def sorted(query) do
    from c in query,
    order_by: [desc: c.inserted_at]
  end

end
