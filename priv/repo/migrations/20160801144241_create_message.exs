defmodule Ruru.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :text, :string
      add :chat_id, references(:chats, on_delete: :nothing)
      add :user_id, references(:users, on_delete: :nothing)
      add :operator_id, references(:operators, on_delete: :nothing)

      timestamps()
    end
    create index(:messages, [:chat_id])

  end
end
