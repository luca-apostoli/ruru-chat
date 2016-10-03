defmodule Ruru.User do

  @moduledoc """
    Ecto model for the User
  """

  use Ruru.Web, :model
  
  import Ecto.Query

  @derive {Poison.Encoder, only: [:id, :name]}

  schema "users" do
    field :name, :string
    field :email, :string

    has_many :chats, Ruru.Chat
    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :email])
    |> validate_required([:name, :email])
  end

  def by_username(query, name) do
    from u in query,    
    where: u.name == ^name
  end

  def by_email(query, email) do
    from u in query,    
    where: u.email == ^email
  end


end
