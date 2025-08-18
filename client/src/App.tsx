/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, DatePicker, Empty, Modal, Pagination, Select, Spin, Switch, Table, Tree, Typography } from 'antd'
import 'antd/dist/reset.css'
import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import logApi, { Metadata } from './api/logApi'

dayjs.extend(utc)

const { Paragraph } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export interface LogDocument {
  _id?: string
  robotId: string
  robotName: string
  message: string
  organizationId: string
  organizationName: string
  sessionId: string
  abnormalType: string | null
  timestamp: string | null
}

interface LogEntry {
  timestamp: string | null
  message: string
  abnormalType: string | null
}

const App: React.FC = () => {
  const lastWeekToToday: [Dayjs, Dayjs] = [dayjs().subtract(7, 'day'), dayjs()]
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(lastWeekToToday)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [organizationId, setOrganizationId] = useState<string>('All')
  const [sessionId, setSessionId] = useState<string>('')

  const [logs, setLogs] = useState<LogDocument[]>([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [metadata, setMetadata] = useState<Metadata | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([])

  const [filterAbnormalOnly, setFilterAbnormalOnly] = useState(true)
  const [displayLocalTime, setDisplayLocalTime] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalPage, setModalPage] = useState(1)

  const [modalLimit] = useState(10)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const observerRef = useRef<HTMLDivElement>(null)
  const handleFetchLogs = async (customPage?: number) => {
    try {
      setLoading(true)
      const payload = {
        limit,
        page: customPage ?? page,
        startDate: dateRange[0] ? dateRange[0].startOf('day').toISOString() : null,
        endDate: dateRange[1] ? dateRange[1].endOf('day').toISOString() : null,
        organizationId: organizationId === 'All' ? '' : organizationId
      }
      const response = await logApi.getLogs(payload)
      setLogs(response.result)
      setMetadata(response.metadata)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchOrganizations = async () => {
    try {
      const startDate = dateRange[0]?.startOf('day').toISOString()
      const endDate = dateRange[1]?.endOf('day').toISOString()

      const response = await logApi.getOrganizations(startDate as string, endDate as string)
      setOrganizations(
        response.length > 0
          ? response.map((i) => ({
              id: i.organizationId,
              name: i.organizationName
            }))
          : []
      )
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  useEffect(() => {
    handleFetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    handleFetchOrganizations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  useEffect(() => {
    if (!isModalOpen || !observerRef.current || !hasMore || modalLoading) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !modalLoading) {
          setModalPage((prevPage) => prevPage + 1)
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 1.0
      }
    )

    observer.observe(observerRef.current)

    return () => {
      if (observerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerRef.current)
      }
    }
  }, [isModalOpen, hasMore, modalLoading])

  useEffect(() => {
    if (isModalOpen) {
      handleFetchSessionLogs(sessionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, modalPage, filterAbnormalOnly, displayLocalTime])

  const handleFetchSessionLogs = async (sessionId: string) => {
    try {
      setModalLoading(true)
      const response = await logApi.getSessionLogs({
        sessionId,
        limit: modalLimit,
        page: modalPage,
        filterAbnormal: filterAbnormalOnly
      })
      setCurrentLogs((prevLogs) => {
        if (modalPage === 1) {
          return response.result
        }
        return [...prevLogs, ...response.result]
      })
      setHasMore(response.metadata.page < response.metadata.totalPages)
    } catch (error) {
      console.error('Failed to fetch session logs:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    handleFetchLogs(1)
  }

  const handleViewDetails = async (sessionId: string) => {
    setModalPage(1)
    setSessionId(sessionId)
    setCurrentLogs([])
    setHasMore(true)
    setModalTitle(sessionId)
    setIsModalOpen(true)
  }

  // --- Build Tree Data ---
  const buildTreeData = (data: any[]) => {
    return data.length > 0
      ? data.map((org) => ({
          title: `Organization ${org.organizationName}:`,
          key: org.organizationId,
          children: org.robots.map((robot: any, index: number) => ({
            title: `Robot ${robot.robotName}:`,
            key: `${org.organizationId}-${robot.robotId}-${index}`,
            children: robot.sessions.map((session: any) => ({
              title: (
                <span>
                  Session {session.sessionId} &nbsp;
                  <a
                    onClick={(e) => {
                      e.stopPropagation()
                      setSessionId(session.sessionId)
                      handleViewDetails(session.sessionId)
                    }}
                  >
                    View Details
                  </a>
                </span>
              ),
              key: session.sessionId,
              children: session.abnormalCounts.map((ab: any, idx: number) => ({
                title: `[${ab.count}] [${ab.abnormalType}]`,
                key: `${session.sessionId}-${idx}`
              }))
            }))
          }))
        }))
      : []
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const treeData = useMemo(() => buildTreeData(logs), [logs])

  const handleReset = () => {
    setDateRange(lastWeekToToday)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Abnormal Messages Dashboard</h2>

      {/* Filter Panel */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}
      >
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange([dates?.[0] ?? null, dates?.[1] ?? null])}
          renderExtraFooter={() => (
            <div style={{ textAlign: 'right' }}>
              <Button type='link' size='small' onClick={handleReset}>
                Reset
              </Button>
            </div>
          )}
        />
        <Select value={organizationId} style={{ width: 200 }} onChange={setOrganizationId}>
          <Option value='All'>All</Option>
          {organizations.length > 0 &&
            organizations.map((org) => (
              <Option key={org.id} value={org.id}>
                {org.name}
              </Option>
            ))}
        </Select>
        <Button type='primary' onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Tree Display */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
          <Spin size='large' />
        </div>
      ) : logs.length > 0 ? (
        <Tree treeData={treeData} />
      ) : (
        <Empty />
      )}

      {/* Pagination */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          padding: '10px 0',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          borderTop: '1px solid #f0f0f0'
        }}
      >
        <Pagination
          current={metadata?.page || 1}
          total={(metadata?.totalPages || 1) * (metadata?.limit || 10)}
          pageSize={metadata?.limit || 10}
          showSizeChanger={false}
          onChange={(page) => setPage(page)}
        />
      </div>

      {/* Session Modal */}
      <Modal
        title={`Session: ${modalTitle}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setModalPage(1)
        }}
        footer={null}
        width={1000}
        style={{ top: '50px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            marginTop: 20
          }}
        >
          <div>
            <Switch
              checked={filterAbnormalOnly}
              onChange={(checked) => {
                setFilterAbnormalOnly(checked)
                setModalPage(1)
                setCurrentLogs([])
              }}
              style={{ marginRight: 10 }}
            />
            Filter abnormal messages only
            <Switch
              checked={displayLocalTime}
              onChange={(checked) => {
                setDisplayLocalTime(checked)
                setModalPage(1)
                setCurrentLogs([])
              }}
              style={{ marginLeft: 20, marginRight: 10 }}
            />{' '}
            Display local time
          </div>
          <span style={{ paddingRight: 10 }}>Records: {currentLogs.length}</span>
        </div>

        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {currentLogs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
              <Spin size='large' />
            </div>
          ) : (
            <Table
              dataSource={currentLogs
                .filter((log) => !filterAbnormalOnly || log.abnormalType !== null)
                .sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime())}
              rowKey={(_, index) => String(index)}
              pagination={false}
              sticky={true}
              columns={[
                {
                  title: 'Timestamp',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  minWidth: 160,
                  render: (value) =>
                    value
                      ? displayLocalTime
                        ? dayjs(value).local().format('YYYY-MM-DD HH:mm:ss')
                        : dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss')
                      : ''
                },
                { title: 'Message', dataIndex: 'message', key: 'message' },
                {
                  title: 'Abnormal Type',
                  dataIndex: 'abnormalType',
                  key: 'abnormalType',
                  minWidth: 160
                }
              ]}
            />
          )}
          <div ref={observerRef} style={{ padding: '10px', textAlign: 'center' }}>
            {hasMore && modalLoading && currentLogs.length !== 0 && (
              <Spin>
                <Paragraph style={{ marginTop: 8 }}>Loading more logs...</Paragraph>
              </Spin>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default App
