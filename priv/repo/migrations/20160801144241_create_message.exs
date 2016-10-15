defmodule Ruru.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :text, :string
      add :chat, references(:chats, on_delete: :nothing)
      add :user, references(:users, on_delete: :nothing)
      add :operator, references(:operators, on_delete: :nothing)

      timestamps()
    end
    create index(:messages, [:chat])

  end
end
