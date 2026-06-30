from __future__ import annotations

from enum import StrEnum


class UserRole(StrEnum):
    """User roles governing access to platform resources."""

    SUPER_ADMIN = "super_admin"
    GOVERNMENT_ADMIN = "government_admin"
    PROVINCE_MANAGER = "province_manager"
    ANALYST = "analyst"
    VIEWER = "viewer"


class Permission(StrEnum):
    """Granular permissions that role-based access control references."""

    # User management
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_LIST = "user:list"

    # Province management
    PROVINCE_READ = "province:read"
    PROVINCE_UPDATE = "province:update"
    PROVINCE_LIST = "province:list"

    # Intelligence products
    SCORE_READ = "score:read"
    INSIGHT_READ = "insight:read"
    RISK_READ = "risk:read"
    RECOMMENDATION_READ = "recommendation:read"

    # Reports
    REPORT_CREATE = "report:create"
    REPORT_READ = "report:read"
    REPORT_LIST = "report:list"

    # Administration
    CONFIG_READ = "config:read"
    CONFIG_UPDATE = "config:update"
    AUDIT_READ = "audit:read"


# Mapping of each role to its granted permissions.
ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.SUPER_ADMIN: {
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_LIST,
        Permission.PROVINCE_READ,
        Permission.PROVINCE_UPDATE,
        Permission.PROVINCE_LIST,
        Permission.SCORE_READ,
        Permission.INSIGHT_READ,
        Permission.RISK_READ,
        Permission.RECOMMENDATION_READ,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_LIST,
        Permission.CONFIG_READ,
        Permission.CONFIG_UPDATE,
        Permission.AUDIT_READ,
    },
    UserRole.GOVERNMENT_ADMIN: {
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_LIST,
        Permission.PROVINCE_READ,
        Permission.PROVINCE_UPDATE,
        Permission.PROVINCE_LIST,
        Permission.SCORE_READ,
        Permission.INSIGHT_READ,
        Permission.RISK_READ,
        Permission.RECOMMENDATION_READ,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_LIST,
        Permission.CONFIG_READ,
        Permission.CONFIG_UPDATE,
        Permission.AUDIT_READ,
    },
    UserRole.PROVINCE_MANAGER: {
        Permission.USER_READ,
        Permission.PROVINCE_READ,
        Permission.PROVINCE_LIST,
        Permission.SCORE_READ,
        Permission.INSIGHT_READ,
        Permission.RISK_READ,
        Permission.RECOMMENDATION_READ,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_LIST,
    },
    UserRole.ANALYST: {
        Permission.USER_READ,
        Permission.PROVINCE_READ,
        Permission.PROVINCE_LIST,
        Permission.SCORE_READ,
        Permission.INSIGHT_READ,
        Permission.RISK_READ,
        Permission.RECOMMENDATION_READ,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_LIST,
    },
    UserRole.VIEWER: {
        Permission.PROVINCE_READ,
        Permission.PROVINCE_LIST,
        Permission.SCORE_READ,
        Permission.INSIGHT_READ,
        Permission.REPORT_READ,
        Permission.REPORT_LIST,
    },
}
