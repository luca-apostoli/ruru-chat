# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Ruru.Repo.insert!(%Ruru.SomeModel{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Ruru.Repo
alias Ruru.Operator
alias Comeonin.Bcrypt
alias Ecto.Changeset

# inserting base operator
changeset = Operator.changeset(%Operator{}, %{name: "admin", email: "admin@ruru.chat", cleanpwd: "admin"})
changeset = Changeset.put_change(changeset, :salt, Bcrypt.gen_salt(12, true))
changeset = Changeset.put_change(changeset, :password, Bcrypt.hashpass(Changeset.get_field(changeset, :cleanpwd), Changeset.get_field(changeset, :salt)))

Repo.insert! changeset
