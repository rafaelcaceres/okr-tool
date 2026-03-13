"use client";

import { MemberList } from "@/components/members/member-list";
import { CreateMemberDialog } from "@/components/members/create-member-dialog";

export default function MembrosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Membros</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre os membros da equipe para associar como responsáveis nos Key Results.
          </p>
        </div>
        <CreateMemberDialog />
      </div>

      <MemberList />
    </div>
  );
}
