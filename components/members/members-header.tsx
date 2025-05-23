import { AddMemberForm } from "./add-member-form"

export function MembersHeader() {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Thành viên</h2>
        <p className="text-muted-foreground">Quản lý thông tin các thành viên trong nhóm</p>
      </div>
      <AddMemberForm />
    </div>
  )
}
