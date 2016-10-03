defmodule Ruru.Message do

  @moduledoc """
    Ecto model for Messages
  """

  use Ruru.Web, :model

  @derive {Poison.Encoder, only: [:id, :text, :user, :operator, :inserted_at]}

  schema "messages" do
    field :text, :string
    belongs_to :user, Ruru.User, foreign_key: :user_id
    belongs_to :operator, Ruru.Operator, foreign_key: :operator_id
    belongs_to :chat, Ruru.Chat, foreign_key: :chat_id

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:text, :user_id, :operator_id, :chat_id])
    |> validate_required([:text, :chat_id])
  end

  def with_users(query) do
    from q in query, preload: [:user]
  end

  def with_operators(query) do
    from q in query, preload: [:operator]
  end

  def by_chat(query, chat) do
    from m in query,
    join: c in Ruru.Chat, on: m.chat_id == c.id,
    where: c.id == ^chat.id
  end

  def by_user(query, user) do
    from m in query,
    join: u in Ruru.User, on: m.user_id == u.id,
    where: u.id == ^user.id
  end

  def by_operator(query, operator) do
    from m in query,
    join: o in Ruru.Operator, on: m.operator_id == o.id,
    where: o.id == ^operator.id
  end

  def sorted(query) do
    from c in query,
    order_by: [asc: c.inserted_at]
  end

end
