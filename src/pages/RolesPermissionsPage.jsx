import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Wrench, Package, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../components/ui/Card';

function RoleCard({ role }) {
  const Icon = role.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex flex-col items-start gap-3 p-5">
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${role.color} text-white`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{role.label}</p>
            <p className="mt-0.5 text-sm text-slate-500">{role.desc}</p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default function RolesPermissionsPage() {
  const { t } = useTranslation();

  const ROLES = [
    { id: 'ADMIN', label: t('roles.admin', 'Admin'), desc: t('roles.descAdmin', 'Full platform access'), icon: Shield, color: 'bg-violet-500' },
    { id: 'TECHNICIAN', label: t('roles.technician', 'Technician'), desc: t('roles.descTechnician', 'Services, bookings, towing'), icon: Wrench, color: 'bg-amber-500' },
    { id: 'SUPPLIER', label: t('roles.supplier', 'Supplier'), desc: t('roles.descSupplier', 'Parts, supply requests'), icon: Package, color: 'bg-emerald-500' },
    { id: 'CUSTOMER', label: t('roles.customer', 'Customer'), desc: t('roles.descCustomer', 'Bookings, vehicles, invoices'), icon: UserCircle, color: 'bg-blue-500' },
  ];

  const PERMISSIONS_MOCK = [
    {
      resource: t('roles.resources.users', 'Users'),
      actions: [t('roles.actionsLabels.list', 'list'), t('roles.actionsLabels.view', 'view'), t('roles.actionsLabels.edit', 'edit'), t('roles.actionsLabels.delete', 'delete')],
      roles: ['ADMIN'],
    },
    {
      resource: t('roles.resources.services', 'Services'),
      actions: [t('roles.actionsLabels.list', 'list'), t('roles.actionsLabels.view', 'view'), t('roles.actionsLabels.create', 'create'), t('roles.actionsLabels.edit', 'edit'), t('roles.actionsLabels.delete', 'delete')],
      roles: ['ADMIN'],
    },
    {
      resource: t('roles.resources.bookings', 'Bookings'),
      actions: [t('roles.actionsLabels.list', 'list'), t('roles.actionsLabels.view', 'view'), t('roles.actionsLabels.create', 'create'), t('roles.actionsLabels.update', 'update')],
      roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'],
    },
    {
      resource: t('roles.resources.invoices', 'Invoices'),
      actions: [t('roles.actionsLabels.list', 'list'), t('roles.actionsLabels.view', 'view')],
      roles: ['ADMIN', 'CUSTOMER'],
    },
    {
      resource: t('roles.resources.settings', 'Settings'),
      actions: [t('roles.actionsLabels.view', 'view'), t('roles.actionsLabels.edit', 'edit')],
      roles: ['ADMIN'],
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('roles.rolesTitle', 'Roles')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role, i) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('roles.permissionsMatrix', 'Permissions matrix')}</h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('roles.resource', 'Resource')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('roles.actions', 'Actions')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      {t('roles.allowedRoles', 'Allowed roles')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERMISSIONS_MOCK.map((row, i) => (
                    <motion.tr
                      key={row.resource}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{row.resource}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{row.actions.join(', ')}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                            >
                              {t(`users.roles.${r}`, r)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
        <p className="mt-3 text-sm text-slate-500">
          {t('roles.enforcementNote', 'Permission rules are enforced in the backend. Edit roles via user management or future admin APIs.')}
        </p>
      </section>
    </div>
  );
}
