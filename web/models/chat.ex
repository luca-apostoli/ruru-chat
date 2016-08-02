defmodule Ruru.Chat do
  use Ruru.Web, :model

  schema "chats" do
    belongs_to :user, Ruru.User
    belongs_to :operator, Ruru.Operator

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [])
    |> validate_required([])
  end
end
