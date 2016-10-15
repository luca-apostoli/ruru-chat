defmodule Ruru.Repo.Migrations.CreateChat do
  use Ecto.Migration

  def change do
    create table(:chats) do
      add :user, references(:users, on_delete: :nothing)
      add :operator, references(:operators, on_delete: :nothing)
      add :status, :boolean, default: false
      timestamps()
    end
    create index(:chats, [:user])
    create index(:chats, [:operator])

  end
end
