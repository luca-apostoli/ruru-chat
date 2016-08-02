defmodule Ruru.Message do
  use Ruru.Web, :model

  schema "messages" do
    field :text, :string
    field :sender, :string
    field :sender_id, :integer
    belongs_to :chat, Ruru.Chat

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
end
