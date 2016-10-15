defmodule Ruru.Repo.Migrations.CreateOperator do
  use Ecto.Migration

  def change do
    create table(:operators) do
      add :name, :string
      add :email, :string
      add :password, :string
      add :salt, :string   

      timestamps()
    end

  end
end
