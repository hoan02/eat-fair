"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Icons } from "@/components/icons"

interface GroupSelectorProps {
  groups: any[]
  defaultGroupId?: string
}

export function GroupSelector({ groups, defaultGroupId }: GroupSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  useEffect(() => {
    // Lấy groupId từ URL hoặc dùng defaultGroupId
    const groupId = searchParams.get("groupId") || defaultGroupId
    if (groupId) {
      setSelectedGroup(groupId)
    }
  }, [searchParams, defaultGroupId])

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId)
    setOpen(false)

    // Cập nhật URL với groupId mới
    const params = new URLSearchParams(searchParams)
    params.set("groupId", groupId)
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  const selectedGroupData = groups.find((group) => group.id === selectedGroup)

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[250px] justify-between">
            {selectedGroupData ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedGroupData.avatar_url || "/placeholder.svg"} alt={selectedGroupData.name} />
                  <AvatarFallback>{selectedGroupData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{selectedGroupData.name}</span>
                {selectedGroupData.role === "owner" && (
                  <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                    Trưởng nhóm
                  </Badge>
                )}
                {selectedGroupData.role === "admin" && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    Phó nhóm
                  </Badge>
                )}
              </div>
            ) : (
              "Chọn nhóm..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Tìm nhóm..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy nhóm nào</CommandEmpty>
              <CommandGroup heading="Nhóm của bạn">
                {groups.map((group) => (
                  <CommandItem
                    key={group.id}
                    value={group.id}
                    onSelect={() => handleGroupChange(group.id)}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={group.avatar_url || "/placeholder.svg"} alt={group.name} />
                      <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{group.name}</span>
                    {group.role === "owner" && (
                      <Badge
                        variant="outline"
                        className="ml-auto bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                      >
                        Trưởng nhóm
                      </Badge>
                    )}
                    {group.role === "admin" && (
                      <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        Phó nhóm
                      </Badge>
                    )}
                    <Check
                      className={cn("ml-auto h-4 w-4", selectedGroup === group.id ? "opacity-100" : "opacity-0")}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem asChild>
                  <Link href="/groups/create" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Tạo nhóm mới</span>
                  </Link>
                </CommandItem>
                <CommandItem asChild>
                  <Link href="/groups/join" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Tham gia nhóm</span>
                  </Link>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/groups/${selectedGroup}/members`}>
            <Icons.users className="mr-2 h-4 w-4" />
            Thành viên
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/groups/${selectedGroup}/settings`}>
            <Icons.settings className="mr-2 h-4 w-4" />
            Cài đặt nhóm
          </Link>
        </Button>
      </div>
    </div>
  )
}
