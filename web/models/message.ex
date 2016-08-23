defmodule Ruru.Message do
  use Ruru.Web, :model

  @derive {Poison.Encoder, only: [:id, :text, :sender, :inserted_at]}

  schema "messages" do
    field :text, :string
    field :sender, :string
    field :sender_id, :integer
    belongs_to :chat, Ruru.Chat, foreign_key: :chat_id

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:text, :sender, :sender_id])
    |> validate_required([:text, :sender, :sender_id])
  end

  def by_chat(query, chat) do
    from m in query,
    join: c in Ruru.Chat, on: m.chat_id == c.id,
    where: c.id == ^chat.id
  end

  def by_user(query, user) do
    from m in query,
    join: u in Ruru.User, on: m.sender_id == u.id,
    where: u.id == ^user.id and m.sender == "user"
  end

  def by_operator(query, operator) do
    from m in query,
    join: o in Ruru.Operator, on: m.sender_id == o.id,
    where: o.id == ^operator.id and m.sender == "operator"
  end

  def sorted(query) do
    from c in query,
    order_by: [desc: c.inserted_at]
  end

end
