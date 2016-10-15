defmodule Ruru.Operator do

  @moduledoc """
    Ecto model for Operators
  """

  use Ruru.Web, :model

  @derive {Poison.Encoder, only: [:id, :name]}

  schema "operators" do
    field :name, :string
    field :email, :string
    field :password, :string
    field :salt, :string
    field :cleanpwd, :string, virtual: true

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :email, :cleanpwd])
    |> validate_required([:name, :email])
  end
end
