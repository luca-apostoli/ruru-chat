defmodule Ruru.Repo.Migrations.CreateChat do
  use Ecto.Migration

  def change do
    create table(:chats) do
      add :user_id, references(:users, on_delete: :nothing)
      add :operator_id, references(:operators, on_delete: :nothing)
      add :status, :boolean, default: false
      timestamps()
    end
    create index(:chats, [:user_id])
    create index(:chats, [:operator_id])

  end
end
